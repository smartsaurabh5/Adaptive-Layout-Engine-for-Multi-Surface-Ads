# Multi-stage build for Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache fontconfig freetype ttf-dejavu

WORKDIR /app
RUN addgroup -S adaptflow && adduser -S adaptflow -G adaptflow \
    && mkdir -p /app/uploads /tmp/uploads \
    && chown -R adaptflow:adaptflow /app /tmp/uploads

USER adaptflow

COPY --from=builder --chown=adaptflow:adaptflow /build/target/app.jar app.jar

EXPOSE 8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Xss256k -Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom"
ENV UPLOAD_DIR="/app/uploads"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
