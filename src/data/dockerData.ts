export interface DockerCommand {
  command: string;
  description: string;
  example: string;
  tip?: string;
}

export interface DockerfileInstruction {
  instruction: string;
  syntax: string;
  description: string;
  example: string;
  tip?: string;
}

export interface ComposeField {
  field: string;
  description: string;
  example: string;
  tip?: string;
}

export interface QuizQuestion {
  question: string;
  code?: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const dockerfileInstructions: DockerfileInstruction[] = [
  {
    instruction: "FROM",
    syntax: "FROM <image>[:<tag>] [AS <name>]",
    description: "Задаёт базовый образ. Должна быть первой инструкцией в Dockerfile (кроме ARG).",
    example: `FROM node:18-alpine AS builder
FROM python:3.11-slim
FROM ubuntu:22.04 AS base`,
    tip: "Используйте Alpine-версии для уменьшения размера образа. Multi-stage builds помогают разделить сборку и runtime."
  },
  {
    instruction: "RUN",
    syntax: "RUN <command> или RUN [\"executable\", \"param1\", \"param2\"]",
    description: "Выполняет команду в новом слое поверх текущего образа. Используется для установки зависимостей.",
    example: `# Shell form
RUN apt-get update && apt-get install -y \\
    curl \\
    vim \\
    && rm -rf /var/lib/apt/lists/*

# Exec form
RUN ["pip", "install", "-r", "requirements.txt"]`,
    tip: "Объединяйте команды в один RUN с && и очищайте кэш в том же слое для уменьшения размера образа."
  },
  {
    instruction: "COPY",
    syntax: "COPY [--chown=<user>:<group>] <src>... <dest>",
    description: "Копирует файлы/директории из контекста сборки в файловую систему образа.",
    example: `COPY package.json package-lock.json ./
COPY --chown=node:node src/ ./src/
COPY . /app/`,
    tip: "Копируйте файлы зависимостей первыми, чтобы использовать кэш слоёв. Избегайте COPY . /app — лучше копируйте конкретные файлы."
  },
  {
    instruction: "ADD",
    syntax: "ADD [--chown=<user>:<group>] <src>... <dest>",
    description: "Аналогично COPY, но может извлекать tar-архивы и загружать файлы по URL.",
    example: `ADD app.tar.gz /app/
ADD https://example.com/file.txt /data/`,
    tip: "Предпочитайте COPY, так как он более прозрачен. ADD используйте только когда нужна автоматическая распаковка tar."
  },
  {
    instruction: "WORKDIR",
    syntax: "WORKDIR /path/to/workdir",
    description: "Устанавливает рабочую директорию для последующих инструкций RUN, CMD, ENTRYPOINT, COPY, ADD.",
    example: `WORKDIR /app
WORKDIR /usr/src/app`,
    tip: "Всегда используйте WORKDIR вместо RUN cd ... && ... — это чище и надёжнее."
  },
  {
    instruction: "ENV",
    syntax: "ENV <key>=<value> ...",
    description: "Устанавливает переменные окружения, которые будут доступны в контейнере.",
    example: `ENV NODE_ENV=production
ENV PORT=3000 APP_NAME=myapp
ENV DATABASE_URL=postgres://user:pass@db:5432/mydb`,
    tip: "Не храните секреты (пароли, ключи) в ENV — используйте Docker secrets или переменные окружения при запуске."
  },
  {
    instruction: "EXPOSE",
    syntax: "EXPOSE <port>[/<protocol>]",
    description: "Документирует, какие порты слушает контейнер. Не публикует порт автоматически.",
    example: `EXPOSE 80
EXPOSE 8080/tcp
EXPOSE 53/udp`,
    tip: "EXPOSE — это документация. Для публикации порта используйте -p при docker run или ports в docker-compose."
  },
  {
    instruction: "CMD",
    syntax: 'CMD ["executable","param1","param2"] или CMD command param1 param2',
    description: "Задаёт команду по умолчанию при запуске контейнера. Может быть переопределена аргументами.",
    example: `# Exec form (рекомендуется)
CMD ["node", "server.js"]
CMD ["python", "app.py"]

# Shell form
CMD python app.py`,
    tip: "Используйте exec form (JSON array). Shell form запускает команду через /bin/sh -c, что добавляет лишний процесс."
  },
  {
    instruction: "ENTRYPOINT",
    syntax: 'ENTRYPOINT ["executable","param1","param2"]',
    description: "Задаёт исполняемый файл при запуске контейнера. Не может быть переопределён (только дополнен).",
    example: `ENTRYPOINT ["python"]
CMD ["app.py"]
# Запуск: docker run myimage other.py → python other.py

ENTRYPOINT ["./entrypoint.sh"]
CMD ["--help"]`,
    tip: "ENTRYPOINT + CMD = гибкая конфигурация. ENTRYPOINT задаёт исполняемый файл, CMD — аргументы по умолчанию."
  },
  {
    instruction: "VOLUME",
    syntax: "VOLUME [\"/data\"] или VOLUME /data /logs",
    description: "Создаёт точку монтирования для внешних хранилищ или других контейнеров.",
    example: `VOLUME ["/data"]
VOLUME /var/log /tmp /data`,
    tip: "Данные в volume переживают контейнер. Используйте для баз данных, логов, пользовательских данных."
  },
  {
    instruction: "USER",
    syntax: "USER <user>[:<group>] или UID[:GID]",
    description: "Задаёт пользователя (UID/GID) для запуска процессов в контейнере.",
    example: `RUN adduser --disabled-password --gecos '' appuser
USER appuser

USER 1000:1000`,
    tip: "Всегда запускайте контейнер от непривилегированного пользователя в production!"
  },
  {
    instruction: "ARG",
    syntax: "ARG <name>[=<default value>]",
    description: "Определяет переменную, передаваемую при сборке образа через --build-arg.",
    example: `ARG NODE_VERSION=18
FROM node:\${NODE_VERSION}-alpine

ARG APP_VERSION=1.0.0
RUN echo "Building version \${APP_VERSION}"`,
    tip: "ARG доступен только при сборке. Для runtime используйте ENV. ARG перед FROM доступен только для FROM."
  },
  {
    instruction: "LABEL",
    syntax: 'LABEL <key>=<value> [<key>=<value> ...]',
    description: "Добавляет метаданные к образу в виде key-value пар.",
    example: `LABEL maintainer="dev@example.com"
LABEL version="1.0" description="My application"
LABEL org.opencontainers.image.source="https://github.com/..."`,
    tip: "Используйте для документации образа, отслеживания версий и организации."
  },
  {
    instruction: "HEALTHCHECK",
    syntax: 'HEALTHCHECK [OPTIONS] CMD command',
    description: "Задаёт команду для проверки работоспособности контейнера.",
    example: `HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

HEALTHCHECK --interval=1m --timeout=10s \\
  CMD ["python", "healthcheck.py"]`,
    tip: "Docker использует HEALTHCHECK для определения статуса контейнера. Оркестраторы (K8s, Swarm) тоже это учитывают."
  },
  {
    instruction: "STOPSIGNAL",
    syntax: "STOPSIGNAL <signal>",
    description: "Задаёт сигнал для graceful shutdown контейнера.",
    example: `STOPSIGNAL SIGTERM
STOPSIGNAL 9`,
    tip: "По умолчанию Docker отправляет SIGTERM, затем SIGKILL через 10 секунд."
  },
  {
    instruction: "SHELL",
    syntax: 'SHELL ["executable", "parameters"]',
    description: "Переопределяет shell по умолчанию для shell-form команд.",
    example: `# Windows
SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop';"]

# Linux — замена sh на bash
SHELL ["/bin/bash", "-c"]`,
    tip: "По умолчанию /bin/sh на Linux и cmd /S /C на Windows."
  }
];

export const composeFields: ComposeField[] = [
  {
    field: "version",
    description: "Версия спецификации Compose (в v2+ необязательна).",
    example: `version: "3.9"`,
    tip: "В Docker Compose V2 поле version устарело и не требуется."
  },
  {
    field: "services",
    description: "Определяет сервисы (контейнеры) приложения.",
    example: `services:
  web:
    image: nginx:latest
  api:
    build: ./backend`,
  },
  {
    field: "build",
    description: "Конфигурация сборки образа. Может быть строкой (путь) или объектом.",
    example: `services:
  web:
    build: .
    
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
      args:
        NODE_ENV: production
      target: production`,
    tip: "context — директория сборки, dockerfile — путь к Dockerfile относительно context."
  },
  {
    field: "image",
    description: "Образ для запуска контейнера.",
    example: `services:
  web:
    image: nginx:1.25-alpine`,
  },
  {
    field: "ports",
    description: "Маппинг портов хост → контейнер.",
    example: `services:
  web:
    ports:
      - "8080:80"
      - "443:443"
      - "127.0.0.1:3000:3000"
      - "9090:9090/udp"`,
    tip: "Формат: HOST:CONTAINER. Если HOST не указан — выбирается случайный порт."
  },
  {
    field: "volumes",
    description: "Монтирование томов и bind mounts.",
    example: `services:
  db:
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./config:/app/config:ro
      - ~/logs:/var/log/app

volumes:
  db-data:
    driver: local`,
    tip: "Именованные volumes управляются Docker. Bind mounts (путь) — это файлы с хоста."
  },
  {
    field: "environment",
    description: "Переменные окружения для контейнера.",
    example: `services:
  app:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/app
      - DEBUG: "true"
    env_file:
      - .env
      - .env.local`,
    tip: "env_file загружает переменные из файла. Переменные в environment переопределяют env_file."
  },
  {
    field: "depends_on",
    description: "Задаёт порядок запуска сервисов.",
    example: `services:
  web:
    depends_on:
      api:
        condition: service_healthy
      db:
        condition: service_started

  api:
    depends_on:
      - db`,
    tip: "condition: service_healthy ждёт, пока healthcheck пройдёт. service_started — просто ждёт запуск."
  },
  {
    field: "networks",
    description: "Подключение сервисов к сетям.",
    example: `services:
  web:
    networks:
      - frontend
  api:
    networks:
      - frontend
      - backend
  db:
    networks:
      - backend

networks:
  frontend:
  backend:
    driver: bridge`,
    tip: "Сервисы в одной сети могут общаться по имени сервиса как hostname."
  },
  {
    field: "restart",
    description: "Политика перезапуска контейнера.",
    example: `services:
  web:
    restart: always
  worker:
    restart: on-failure:3
  debug:
    restart: "no"`,
    tip: "no — не перезапускать. always — всегда. on-failure — при ошибке. unless-stopped — всегда, кроме ручной остановки."
  },
  {
    field: "deploy",
    description: "Конфигурация для Docker Swarm / deploy.",
    example: `services:
  web:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          cpus: "0.25"
          memory: 256M
      restart_policy:
        condition: on-failure
        delay: 5s`,
  },
  {
    field: "command",
    description: "Переопределяет CMD из образа.",
    example: `services:
  web:
    image: node:18
    command: npm start
    
  worker:
    image: python:3.11
    command: ["python", "worker.py"]`,
  },
  {
    field: "healthcheck",
    description: "Проверка работоспособности контейнера.",
    example: `services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s`,
  }
];

export const dockerfileExamples = [
  {
    title: "Node.js приложение (Multi-stage)",
    code: `# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
CMD ["node", "dist/index.js"]`
  },
  {
    title: "Python FastAPI",
    code: `FROM python:3.11-slim AS base

WORKDIR /app

# Install dependencies first (cache-friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Non-root user
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`
  },
  {
    title: "Go приложение",
    code: `# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

# Runtime stage
FROM alpine:3.18
RUN apk --no-cache add ca-certificates tzdata
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]`
  },
  {
    title: "Nginx + React SPA",
    code: `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
  }
];

export const composeExamples = [
  {
    title: "Full-stack приложение",
    code: `services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api
    networks:
      - frontend

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp
      - REDIS_URL=redis://cache:6379
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    networks:
      - frontend
      - backend
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  cache:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - backend

volumes:
  postgres_data:
  redis_data:

networks:
  frontend:
  backend:`
  },
  {
    title: "Микросервисы с мониторингом",
    code: `services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:`
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Какая инструкция Dockerfile должна быть ПЕРВОЙ (кроме ARG)?",
    options: ["RUN", "FROM", "WORKDIR", "COPY"],
    correct: 1,
    explanation: "FROM должна быть первой инструкцией. Она задаёт базовый образ, на котором строится всё остальное."
  },
  {
    question: "В чём разница между CMD и ENTRYPOINT?",
    options: [
      "Нет разницы, это синонимы",
      "CMD можно переопределить аргументами, ENTRYPOINT — нет (только дополнить)",
      "ENTRYPOINT можно переопределить, CMD — нет",
      "CMD выполняется при сборке, ENTRYPOINT — при запуске"
    ],
    correct: 1,
    explanation: "CMD задаёт команду по умолчанию и может быть полностью переопределена. ENTRYPOINT задаёт исполняемый файл, а аргументы docker run добавляются к нему."
  },
  {
    question: "Что делает инструкция EXPOSE?",
    options: [
      "Открывает порт на хосте",
      "Создаёт правило iptables",
      "Документирует, какие порты слушает контейнер",
      "Настраивает NAT"
    ],
    correct: 2,
    explanation: "EXPOSE — это только документация. Она не публикует порт. Для публикации используйте -p при docker run или ports в docker-compose."
  },
  {
    question: "Какой формат CMD рекомендуется использовать?",
    options: [
      "Shell form: CMD python app.py",
      "Exec form: CMD [\"python\", \"app.py\"]",
      "Оба равнозначны",
      "Entrypoint form: CMD --entrypoint python"
    ],
    correct: 1,
    explanation: "Exec form (JSON array) рекомендуется, так как не запускает лишний shell-процесс и правильно обрабатывает сигналы."
  },
  {
    question: "Как правильно оптимизировать кэш слоёв Docker?",
    options: [
      "Копировать все файлы в начале, затем устанавливать зависимости",
      "Копировать файлы зависимостей, установить их, затем копировать остальное",
      "Использовать только один RUN для всего",
      "Не использовать WORKDIR"
    ],
    correct: 1,
    explanation: "Копируя package.json/requirements.txt первыми и устанавливая зависимости, мы используем кэш Docker. При изменении кода зависимости не переустанавливаются."
  },
  {
    question: "Что делает depends_on с condition: service_healthy?",
    options: [
      "Ждёт, пока контейнер запустится",
      "Ждёт, пока healthcheck контейнера пройдёт успешно",
      "Проверяет, что порт открыт",
      "Перезапускает сервис при ошибке"
    ],
    correct: 1,
    explanation: "condition: service_healthy ждёт, пока healthcheck целевого сервиса пройдёт успешно. Это гарантирует, что сервис действительно готов принимать запросы."
  },
  {
    question: "Какой restart policy перезапускает контейнер только при сбое?",
    options: [
      "always",
      "on-failure",
      "unless-stopped",
      "no"
    ],
    correct: 1,
    explanation: "on-failure перезапускает контейнер только если он завершился с ненулевым кодом. Можно указать максимальное число попыток: on-failure:5."
  },
  {
    question: "Как правильно запускать контейнер от непривилегированного пользователя?",
    options: [
      "EXPOSE 80",
      "USER appuser",
      "RUN chmod 777 /app",
      "VOLUME /data"
    ],
    correct: 1,
    explanation: "USER задаёт пользователя для запуска процессов. Это security best practice — не запускайте production-контейнеры от root."
  },
  {
    question: "Что такое multi-stage build?",
    options: [
      "Сборка на нескольких серверах одновременно",
      "Dockerfile с несколькими FROM, где каждый stage может копировать артефакты из предыдущих",
      "Запуск нескольких контейнеров из одного Dockerfile",
      "Сборка образа с несколькими тегами"
    ],
    correct: 1,
    explanation: "Multi-stage build позволяет использовать несколько FROM инструкций. Каждый stage может копировать артефакты из предыдущих через COPY --from=<stage>. Это уменьшает финальный образ."
  },
  {
    question: "Чем COPY отличается от ADD?",
    options: [
      "Ничем, это синонимы",
      "ADD может автоматически распаковывать tar-архивы и загружать файлы по URL",
      "COPY быстрее работает",
      "ADD работает только с директориями"
    ],
    correct: 1,
    explanation: "ADD может распаковывать tar и загружать по URL. В остальных случаях предпочитайте COPY — он более прозрачен и предсказуем."
  }
];

export const bestPractices = [
  {
    title: "Используйте .dockerignore",
    description: "Исключайте node_modules, .git, .env и другие ненужные файлы из контекста сборки.",
    example: `node_modules
.git
.env
*.md
Dockerfile
docker-compose.yml`
  },
  {
    title: "Минимизируйте количество слоёв",
    description: "Объединяйте команды RUN через && и очищайте кэш в том же слое.",
    example: `# Плохо
RUN apt-get update
RUN apt-get install -y python3
RUN rm -rf /var/lib/apt/lists/*

# Хорошо
RUN apt-get update && \\
    apt-get install -y python3 && \\
    rm -rf /var/lib/apt/lists/*`
  },
  {
    title: "Не запускайте от root",
    description: "Создайте непривилегированного пользователя и используйте USER.",
    example: `RUN adduser --disabled-password --gecos '' appuser
USER appuser`
  },
  {
    title: "Используйте конкретные теги",
    description: "Не используйте :latest в production. Фиксируйте версии.",
    example: `# Плохо
FROM node:latest

# Хорошо
FROM node:18.17-alpine`
  },
  {
    title: "Используйте HEALTHCHECK",
    description: "Помогает оркестраторам определять состояние контейнера.",
    example: `HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:3000/health || exit 1`
  },
  {
    title: "Порядок инструкций для кэша",
    description: "Размещайте редко меняющиеся инструкции в начале.",
    example: `# 1. FROM
# 2. ENV (редко меняется)
# 3. RUN установка системных пакетов
# 4. COPY файлов зависимостей
# 5. RUN установка зависимостей
# 6. COPY исходного кода (часто меняется)
# 7. CMD`
  }
];
