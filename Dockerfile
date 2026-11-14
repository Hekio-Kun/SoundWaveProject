# Multi-stage build for SoundWave Spring Boot (Java 21) from Monorepo Root
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

# Copy Maven wrapper, dependencies, and backend source
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .
COPY backend/src src

RUN chmod +x ./mvnw
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
WORKDIR /app
COPY --from=build /workspace/app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
