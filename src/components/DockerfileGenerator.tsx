import { useState } from 'react';
import CodeBlock from './CodeBlock';

interface GeneratorState {
  language: string;
  port: string;
  multiStage: boolean;
  healthcheck: boolean;
  nonRoot: boolean;
  envVars: string;
  customCmd: string;
}

export default function DockerfileGenerator() {
  const [state, setState] = useState<GeneratorState>({
    language: 'node',
    port: '3000',
    multiStage: true,
    healthcheck: true,
    nonRoot: true,
    envVars: 'NODE_ENV=production',
    customCmd: '',
  });

  const generateDockerfile = (): string => {
    let dockerfile = '';

    switch (state.language) {
      case 'node':
        dockerfile = generateNodeDockerfile(state);
        break;
      case 'python':
        dockerfile = generatePythonDockerfile(state);
        break;
      case 'go':
        dockerfile = generateGoDockerfile(state);
        break;
      case 'java':
        dockerfile = generateJavaDockerfile(state);
        break;
      case 'rust':
        dockerfile = generateRustDockerfile(state);
        break;
    }

    return dockerfile;
  };

  const generateNodeDockerfile = (s: GeneratorState): string => {
    let df = '';
    if (s.multiStage) {
      df += `# Stage 1: Dependencies & Build\n`;
      df += `FROM node:20-alpine AS builder\n`;
      df += `WORKDIR /app\n\n`;
      df += `COPY package*.json ./\n`;
      df += `RUN npm ci --only=production\n\n`;
      df += `COPY . .\n`;
      df += `RUN npm run build\n\n`;
      df += `# Stage 2: Production\n`;
      df += `FROM node:20-alpine\n`;
    } else {
      df += `FROM node:20-alpine\n`;
      df += `WORKDIR /app\n\n`;
    }
    df += `WORKDIR /app\n\n`;
    if (s.nonRoot) {
      df += `RUN addgroup -g 1001 -S appgroup && \\\n`;
      df += `    adduser -S appuser -u 1001 -G appgroup\n\n`;
    }
    if (s.multiStage) {
      df += `COPY --from=builder --chown=${s.nonRoot ? 'appuser:appgroup' : 'root:root'} /app/node_modules ./node_modules\n`;
      df += `COPY --from=builder --chown=${s.nonRoot ? 'appuser:appgroup' : 'root:root'} /app/dist ./dist\n\n`;
    } else {
      df += `COPY package*.json ./\n`;
      df += `RUN npm ci --only=production\n`;
      df += `COPY . .\n\n`;
    }
    if (s.envVars) {
      s.envVars.split('\n').filter(Boolean).forEach(env => {
        df += `ENV ${env.trim()}\n`;
      });
      df += `\n`;
    }
    df += `EXPOSE ${s.port}\n\n`;
    if (s.healthcheck) {
      df += `HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\\n`;
      df += `  CMD wget --no-verbose --tries=1 --spider http://localhost:${s.port}/ || exit 1\n\n`;
    }
    if (s.nonRoot) {
      df += `USER appuser\n\n`;
    }
    df += s.customCmd
      ? `CMD ${s.customCmd}\n`
      : `CMD ["node", "dist/index.js"]\n`;
    return df;
  };

  const generatePythonDockerfile = (s: GeneratorState): string => {
    let df = `FROM python:3.12-slim\n\n`;
    df += `WORKDIR /app\n\n`;
    if (s.nonRoot) {
      df += `RUN useradd --create-home --shell /bin/bash appuser\n\n`;
    }
    df += `COPY requirements.txt .\n`;
    df += `RUN pip install --no-cache-dir -r requirements.txt\n\n`;
    df += `COPY . .\n\n`;
    if (s.envVars) {
      s.envVars.split('\n').filter(Boolean).forEach(env => {
        df += `ENV ${env.trim()}\n`;
      });
      df += `\n`;
    }
    df += `EXPOSE ${s.port}\n\n`;
    if (s.healthcheck) {
      df += `HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \\\n`;
      df += `  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${s.port}/health')" || exit 1\n\n`;
    }
    if (s.nonRoot) {
      df += `USER appuser\n\n`;
    }
    df += s.customCmd
      ? `CMD ${s.customCmd}\n`
      : `CMD ["python", "app.py"]\n`;
    return df;
  };

  const generateGoDockerfile = (s: GeneratorState): string => {
    let df = '';
    if (s.multiStage) {
      df += `# Build stage\n`;
      df += `FROM golang:1.22-alpine AS builder\n`;
      df += `WORKDIR /build\n\n`;
      df += `COPY go.mod go.sum ./\n`;
      df += `RUN go mod download\n\n`;
      df += `COPY . .\n`;
      df += `RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /build/app .\n\n`;
      df += `# Runtime stage\n`;
      df += `FROM alpine:3.19\n`;
      df += `RUN apk --no-cache add ca-certificates tzdata\n\n`;
    } else {
      df += `FROM golang:1.22-alpine\n`;
      df += `WORKDIR /app\n\n`;
    }
    if (s.nonRoot) {
      df += `RUN adduser -D -u 1000 appuser\n\n`;
    }
    if (s.multiStage) {
      df += `COPY --from=builder /build/app /app\n\n`;
    } else {
      df += `COPY . .\n`;
      df += `RUN go build -o /app/app .\n\n`;
    }
    if (s.envVars) {
      s.envVars.split('\n').filter(Boolean).forEach(env => {
        df += `ENV ${env.trim()}\n`;
      });
      df += `\n`;
    }
    df += `EXPOSE ${s.port}\n\n`;
    if (s.healthcheck) {
      df += `HEALTHCHECK --interval=30s --timeout=3s \\\n`;
      df += `  CMD wget --no-verbose --tries=1 --spider http://localhost:${s.port}/health || exit 1\n\n`;
    }
    if (s.nonRoot) {
      df += `USER appuser\n\n`;
    }
    df += s.customCmd
      ? `CMD ${s.customCmd}\n`
      : `ENTRYPOINT ["/app"]\n`;
    return df;
  };

  const generateJavaDockerfile = (s: GeneratorState): string => {
    let df = '';
    if (s.multiStage) {
      df += `# Build stage\n`;
      df += `FROM eclipse-temurin:21-jdk-alpine AS builder\n`;
      df += `WORKDIR /build\n\n`;
      df += `COPY . .\n`;
      df += `RUN ./gradlew bootJar --no-daemon\n\n`;
      df += `# Runtime stage\n`;
      df += `FROM eclipse-temurin:21-jre-alpine\n`;
    } else {
      df += `FROM eclipse-temurin:21-jre-alpine\n`;
      df += `WORKDIR /app\n\n`;
    }
    if (s.nonRoot) {
      df += `RUN adduser -D -u 1000 appuser\n\n`;
    }
    if (s.multiStage) {
      df += `COPY --from=builder /build/build/libs/*.jar /app/app.jar\n\n`;
    } else {
      df += `COPY build/libs/*.jar /app/app.jar\n\n`;
    }
    if (s.envVars) {
      s.envVars.split('\n').filter(Boolean).forEach(env => {
        df += `ENV ${env.trim()}\n`;
      });
      df += `\n`;
    }
    df += `EXPOSE ${s.port}\n\n`;
    if (s.healthcheck) {
      df += `HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \\\n`;
      df += `  CMD wget --no-verbose --tries=1 --spider http://localhost:${s.port}/actuator/health || exit 1\n\n`;
    }
    if (s.nonRoot) {
      df += `USER appuser\n\n`;
    }
    df += s.customCmd
      ? `CMD ${s.customCmd}\n`
      : `ENTRYPOINT ["java", "-jar", "/app/app.jar"]\n`;
    return df;
  };

  const generateRustDockerfile = (s: GeneratorState): string => {
    let df = '';
    if (s.multiStage) {
      df += `# Build stage\n`;
      df += `FROM rust:1.76-alpine AS builder\n`;
      df += `RUN apk add --no-cache musl-dev\n`;
      df += `WORKDIR /build\n\n`;
      df += `COPY Cargo.toml Cargo.lock ./\n`;
      df += `COPY src ./src\n`;
      df += `RUN cargo build --release\n\n`;
      df += `# Runtime stage\n`;
      df += `FROM alpine:3.19\n`;
      df += `RUN apk --no-cache add ca-certificates\n\n`;
    } else {
      df += `FROM rust:1.76-alpine\n`;
      df += `RUN apk add --no-cache musl-dev\n`;
      df += `WORKDIR /app\n\n`;
    }
    if (s.nonRoot) {
      df += `RUN adduser -D -u 1000 appuser\n\n`;
    }
    if (s.multiStage) {
      df += `COPY --from=builder /build/target/release/app /usr/local/bin/app\n\n`;
    } else {
      df += `COPY . .\n`;
      df += `RUN cargo build --release\n\n`;
    }
    if (s.envVars) {
      s.envVars.split('\n').filter(Boolean).forEach(env => {
        df += `ENV ${env.trim()}\n`;
      });
      df += `\n`;
    }
    df += `EXPOSE ${s.port}\n\n`;
    if (s.healthcheck) {
      df += `HEALTHCHECK --interval=30s --timeout=3s \\\n`;
      df += `  CMD wget --no-verbose --tries=1 --spider http://localhost:${s.port}/health || exit 1\n\n`;
    }
    if (s.nonRoot) {
      df += `USER appuser\n\n`;
    }
    df += s.customCmd
      ? `CMD ${s.customCmd}\n`
      : `ENTRYPOINT ["app"]\n`;
    return df;
  };

  const generatedDockerfile = generateDockerfile();

  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">
        Настройте параметры и получите готовый Dockerfile для вашего проекта.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-5">
          <h3 className="text-lg font-semibold text-white">⚙️ Настройки</h3>

          {/* Language */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Язык / Фреймворк</label>
            <select
              value={state.language}
              onChange={(e) => setState({ ...state, language: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="node">Node.js</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="java">Java (Spring Boot)</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          {/* Port */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Порт</label>
            <input
              type="text"
              value={state.port}
              onChange={(e) => setState({ ...state, port: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="3000"
            />
          </div>

          {/* Environment variables */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Переменные окружения (по одной на строку)</label>
            <textarea
              value={state.envVars}
              onChange={(e) => setState({ ...state, envVars: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500 h-20 resize-none"
              placeholder="NODE_ENV=production"
            />
          </div>

          {/* Custom CMD */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Custom CMD (необязательно)</label>
            <input
              type="text"
              value={state.customCmd}
              onChange={(e) => setState({ ...state, customCmd: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
              placeholder='["node", "server.js"]'
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.multiStage}
                onChange={(e) => setState({ ...state, multiStage: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Multi-stage build</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.healthcheck}
                onChange={(e) => setState({ ...state, healthcheck: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">HEALTHCHECK</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.nonRoot}
                onChange={(e) => setState({ ...state, nonRoot: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Non-root пользователь</span>
            </label>
          </div>
        </div>

        {/* Generated Dockerfile */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">📄 Результат</h3>
          <CodeBlock code={generatedDockerfile} language="dockerfile" title="Dockerfile" />
        </div>
      </div>
    </div>
  );
}
