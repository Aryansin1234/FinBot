# ── Stage 1: Build — install deps with full compiler toolchain ──────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build tools only in builder stage (NOT in final image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first → maximise layer cache reuse
COPY requirements.txt .

# Install into a prefix dir so we can copy cleanly into final stage
RUN pip install --prefix=/install --no-warn-script-location -r requirements.txt

# ── Stage 2: Runtime — tiny image, no compiler, no build cache ───────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Runtime-only system deps (curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application source (last → cheapest cache layer to invalidate)
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
