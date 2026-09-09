# Definisci i programmi e i relativi siti web
$softwareList = @(
    @{programma = "programma1"; sito = "https://example.com/page1-with-java-version"},
    @{programma = "programma2"; sito = "https://example.com/page2-with-java-version"},
    @{programma = "programma3"; sito = "https://example.com/page3-with-java-version"}
)

# Funzione per controllare se un programma è installato
function Test-ProgramInstalled {
    param (
        [string]$programName
    )
    $programs = Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*,
                               HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*,
                               HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*
    return $programs | Where-Object { $_.DisplayName -like "*$programName*" }
}

# Funzione per ottenere la versione di Java installata
function Get-InstalledJavaVersion {
    $javaVersionOutput = java -version 2>&1
    if ($javaVersionOutput -match 'version "([0-9]+(\.[0-9]+)*)') {
        return $matches[1]
    }
    return $null
}

# Funzione per estrarre la versione di Java da una pagina HTML
function Get-JavaVersion {
    param (
        [string]$htmlContent
    )
    
    $lines = $htmlContent -split "`n"
    foreach ($line in $lines) {
        if ($line -match "Java\s+([0-9]+(\.[0-9]+)*)") {
            return $matches[1]
        }
    }
    return $null
}

# Funzione per convertire la versione di Java in un formato comparabile
function Convert-VersionToComparable {
    param (
        [string]$version
    )
    
    $parts = $version -split "\."
    return [Version]::new($parts[0], $parts[1], $parts[2])
}

# Inizializza una variabile per memorizzare la versione di Java più vecchia trovata
$oldestJavaVersion = $null
$oldestJavaUrl = $null

# Cicla attraverso la lista dei software
foreach ($software in $softwareList) {
    $programName = $software.programma
    $url = $software.sito
    

    if (Test-ProgramInstalled -programName $programName) {
        Write-Output "$programName è installato. Controllo la versione di Java su $url"
        
        try {
            $response = Invoke-WebRequest -Uri $url
            $javaVersion = Get-JavaVersion -htmlContent $response.Content
            if ($javaVersion) {
                Write-Output "Trovata versione Java $javaVersion su $url"
                $comparableVersion = Convert-VersionToComparable -version $javaVersion
                if (-not $oldestJavaVersion -or $comparableVersion -lt $oldestJavaVersion) {
                    $oldestJavaVersion = $comparableVersion
                    $oldestJavaUrl = $url
                }
            } else {
                Write-Output "Nessuna versione di Java trovata su $url"
            }
        } catch {
            Write-Output "Errore durante l'accesso a $url : $_"
        }
    } else {
        Write-Output "$programName non è installato."
    }
}

# Stampa la versione di Java più vecchia trovata
if ($oldestJavaVersion) {
    Write-Output "La versione di Java più vecchia trovata è $oldestJavaVersion su $oldestJavaUrl"
} else {
    Write-Output "Nessuna versione di Java trovata su nessuna pagina."
    exit
}

# Verifica la versione di Java attualmente installata sul PC
$installedJavaVersion = Get-InstalledJavaVersion
if ($installedJavaVersion) {
    $installedJavaComparableVersion = Convert-VersionToComparable -version $installedJavaVersion
    Write-Output "Versione di Java attualmente installata: $installedJavaVersion"
} else {
    Write-Output "Java non è attualmente installato sul PC."
    $installedJavaComparableVersion = [Version]::new(0, 0, 0)
}

# Confronta la versione di Java installata con quella trovata
if ($oldestJavaVersion -gt $installedJavaComparableVersion) {
    Write-Output "La versione trovata ($oldestJavaVersion) è più recente di quella installata ($installedJavaVersion). Procedo con l'installazione."
    

    $installerPath = "$env:TEMP\java_installer.exe"
    Invoke-WebRequest -Uri "https://path-to-java-installer.exe" -OutFile $installerPath
    

    Start-Process -FilePath $installerPath -ArgumentList "/s" -Wait
    

    $newInstalledJavaVersion = Get-InstalledJavaVersion
    if ($newInstalledJavaVersion) {
        Write-Output "Java è stato aggiornato con successo alla versione $newInstalledJavaVersion."
    } else {
        Write-Output "Si è verificato un errore durante l'installazione di Java."
    }
} else {
    Write-Output "La versione di Java installata ($installedJavaVersion) è già aggiornata."
}
