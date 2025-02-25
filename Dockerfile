# Build stage
FROM gradle:jdk21 AS build
WORKDIR /app
COPY . .

# Gradle 권한 설정 및 빌드 실행
RUN chmod +x ./gradlew
RUN ./gradlew bootWar --no-daemon

# Runtime stage
FROM ubuntu:jammy

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y openjdk-21-jdk openssh-server wget locales && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 한글 로케일 설치 및 구성
RUN locale-gen ko_KR.UTF-8
ENV LANG ko_KR.UTF-8
ENV LANGUAGE ko_KR:ko
ENV LC_ALL ko_KR.UTF-8

# SSH configuration
RUN echo 'root:ssh' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Download and install Tomcat
RUN wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.36/bin/apache-tomcat-10.1.36.tar.gz -O /tmp/tomcat.tar.gz && \
    tar xvfz /tmp/tomcat.tar.gz -C /usr/local && \
    mv /usr/local/apache-tomcat-10.1.36 /usr/local/tomcat && \
    rm /tmp/tomcat.tar.gz

# 기존 ROOT 애플리케이션 제거 (있다면)
RUN rm -rf /usr/local/tomcat/webapps/ROOT*

# Copy WAR file from build stage and rename it
RUN mkdir -p /usr/local/tomcat/webapps
COPY --from=build /app/build/libs/*.war /usr/local/tomcat/webapps/ROOT.war

# Set environment variables and configurations
RUN echo 'cd /usr/local/tomcat/webapps' >> /root/.bashrc
RUN echo 'export CATALINA_HOME=/usr/local/tomcat' > /etc/profile.d/tomcat.sh && \
    echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> /etc/profile.d/tomcat.sh && \
    echo 'export PATH=$CATALINA_HOME/bin:$JAVA_HOME/bin:$PATH' >> /etc/profile.d/tomcat.sh && \
    chmod +x /etc/profile.d/tomcat.sh

# Tomcat 권한 설정
RUN chown -R root:root /usr/local/tomcat && \
    chmod -R g+r /usr/local/tomcat/webapps

EXPOSE 22 8080

CMD service ssh start && /usr/local/tomcat/bin/catalina.sh run