FROM openjdk:17
ARG JAR_FILE=./target/*.jar
COPY ${JAR_FILE} ms-customer.jar
ENTRYPOINT ["java", "-jar", "./ms-customer.jar"]
