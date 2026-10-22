# Huddle's code judge — Java, C, C++, Python and Node in one small image.
#
# Built once on the machine that runs the server (start-server.sh does it);
# the server then starts a throwaway container from it for every submission,
# with no network, capped resources and a read-only filesystem.

FROM eclipse-temurin:21-jdk-jammy

RUN apt-get update \
 && apt-get install -y --no-install-recommends g++ gcc python3 nodejs \
 && rm -rf /var/lib/apt/lists/*

COPY run.py /judge/run.py

# Nobody, not root — inside a container that is already locked down.
USER 65534:65534
WORKDIR /tmp
ENTRYPOINT ["python3", "/judge/run.py"]
