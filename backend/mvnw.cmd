@REM Maven Wrapper script for Windows
@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists

@REM Read distributionUrl from maven-wrapper.properties
for /f "usebackq tokens=1,2 delims==" %%a in ("%MAVEN_WRAPPER_PROPERTIES%") do (
    if "%%a"=="distributionUrl" set DOWNLOAD_URL=%%b
)

@REM Extract version name (e.g., apache-maven-3.9.6-bin -> apache-maven-3.9.6)
for %%i in (%DOWNLOAD_URL%) do set DIST_FILENAME=%%~ni
@REM Remove -bin suffix
set DIST_NAME=%DIST_FILENAME:-bin=%

set MAVEN_DIST=%MAVEN_HOME%\%DIST_NAME%
set MVN_CMD=%MAVEN_DIST%\bin\mvn.cmd

if exist "%MVN_CMD%" goto runMaven

echo Downloading Maven from %DOWNLOAD_URL%...
mkdir "%MAVEN_HOME%" 2>nul
set DIST_ZIP=%MAVEN_HOME%\%DIST_FILENAME%.zip

powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%DIST_ZIP%' }"

if not exist "%DIST_ZIP%" (
    echo ERROR: Failed to download Maven distribution
    exit /b 1
)

echo Extracting Maven...
powershell -Command "& { Expand-Archive -Path '%DIST_ZIP%' -DestinationPath '%MAVEN_HOME%' -Force }"
del "%DIST_ZIP%" 2>nul

if not exist "%MVN_CMD%" (
    echo ERROR: Maven extraction failed. Expected: %MVN_CMD%
    exit /b 1
)

:runMaven
"%MVN_CMD%" %*
