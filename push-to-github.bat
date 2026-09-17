@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ================================================================
echo   Push catre https://github.com/cezar-constantin/analiza_financiara_cu_ai_avansat
echo ================================================================
echo.

if exist ".git\index.lock" del /f /q ".git\index.lock"

if not exist ".git" (
  echo [1/6] Initializez repo-ul local...
  git init
  git branch -M main
) else (
  echo [1/6] Repo-ul local exista deja.
)

echo [2/6] Configurez remote-ul...
git remote remove origin 2>nul
git remote add origin https://github.com/cezar-constantin/analiza_financiara_cu_ai_avansat.git

echo [3/6] Adaug fisierele...
git add -A

echo [4/6] Commit...
git commit -m "Lentila 2: corelatii si anomalii (praguri, z-score si IQR, reziduuri pe relatii, scor 0-100)" || echo (nimic nou de comis)

echo [5/6] Push...
git push -u origin main
set EXITCODE=%ERRORLEVEL%

echo [6/6] Scriu rezultatul in push-result.txt...
(
  echo EXITCODE=%EXITCODE%
  echo.
  git log --oneline -3
  echo.
  git remote -v
) > push-result.txt 2>&1

echo.
if "%EXITCODE%"=="0" (
  echo GATA. Push reusit.
  echo.
  echo Workflow-ul de GitHub Actions activeaza singur Pages si publica.
  echo Dupa 1-2 minute, site-ul este la:
  echo   https://cezar-constantin.github.io/analiza_financiara_cu_ai_avansat/
  echo.
  echo Daca workflow-ul tot da eroare la pasul "Setup Pages", atunci
  echo activeaza manual, o singura data:
  echo   GitHub ^> repo ^> Settings ^> Pages ^> Source = "GitHub Actions"
  echo si apoi Actions ^> ultimul run ^> "Re-run all jobs".
) else (
  echo Push-ul a esuat cu codul %EXITCODE%. Detalii in push-result.txt
)
echo.
pause
