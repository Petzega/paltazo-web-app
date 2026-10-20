# Script para instalar extensiones de VS Code automáticamente

if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Error "El comando 'code' no se encuentra en el PATH. Abre VS Code, presiona Ctrl+Shift+P y ejecuta: 'Shell Command: Install ''code'' command in PATH'."
    exit 1
}

$extensions = @(
    "aeschli.vscode-css-formatter",
    "andrew-codes.cypress-snippets",
    "angular.ng-template",
    "blackboxapp.blackbox",
    "blackboxapp.blackboxagent",
    "blodwynn.featurehighlight",
    "christian-kohler.path-intellisense",
    "cucumberopen.cucumber-official",
    "dbaeumer.vscode-eslint",
    "docker.docker",
    "eamodio.gitlens",
    "esbenp.prettier-vscode",
    "formulahendry.auto-rename-tag",
    "formulahendry.code-runner",
    "gerrnperl.outline-map",
    "golang.go",
    "google.geminicodeassist",
    "irongeek.vscode-env",
    "johnpapa.angular2",
    "mechatroner.rainbow-csv",
    "mhutchie.git-graph",
    "ms-azuretools.vscode-containers",
    "ms-azuretools.vscode-docker",
    "ms-ceintl.vscode-language-pack-es",
    "ms-playwright.playwright",
    "ms-python.debugpy",
    "ms-python.isort",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-python.vscode-python-envs",
    "ms-toolsai.jupyter",
    "ms-toolsai.jupyter-keymap",
    "ms-toolsai.jupyter-renderers",
    "ms-toolsai.vscode-jupyter-cell-tags",
    "ms-toolsai.vscode-jupyter-slideshow",
    "ms-vscode-remote.remote-containers",
    "ms-vscode-remote.remote-wsl",
    "ms-vscode.cpptools",
    "pkief.material-icon-theme",
    "platformio.platformio-ide",
    "redhat.java",
    "repreng.csv",
    "ritwickdey.liveserver",
    "thekalinga.bootstrap4-vscode",
    "usernamehw.errorlens",
    "visualstudioexptteam.intellicode-api-usage-examples",
    "visualstudioexptteam.vscodeintellicode",
    "vscjava.vscode-gradle",
    "vscjava.vscode-java-debug",
    "vscjava.vscode-java-dependency",
    "vscjava.vscode-java-pack",
    "vscjava.vscode-java-test",
    "vscjava.vscode-maven"
)

$total = $extensions.Count
$current = 1

Write-Host "Instalando $total extensiones en VS Code..." -ForegroundColor Cyan

foreach ($ext in $extensions) {
    Write-Host "[$current/$total] Instalando: $ext" -ForegroundColor Yellow
    code --install-extension $ext --force
    $current++
}

Write-Host "Todas las extensiones se procesaron correctamente." -ForegroundColor Green
