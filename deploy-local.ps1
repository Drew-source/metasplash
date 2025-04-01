    # deploy-local.ps1
    # Simple script to stage all changes, commit with a user-provided message,
    # and push to the 'main' branch on 'origin' to trigger GitHub Actions.

    param(
        [Parameter(Mandatory=$false)]
        [string]$CommitMessage
    )

    # --- Get Commit Message ---
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        Write-Host "No commit message provided via parameter."
        $CommitMessage = Read-Host -Prompt "Please enter the commit message"
    }

    # Validate commit message
    if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
        Write-Error "Commit message cannot be empty. Aborting."
        Read-Host "Press Enter to exit" # Pause to let user see error
        exit 1
    }

    Write-Host "Using commit message: '$CommitMessage'"

    # --- Git Add ---
    Write-Host "`nStaging all changes..."
    git add .
    # Add more robust error checking for 'git add' if needed, e.g., check git status

    # --- Git Commit ---
    Write-Host "`nCommitting changes..."
    git commit -m "$CommitMessage"

    # Check if commit was successful (e.g., maybe there were no changes)
    if ($LASTEXITCODE -ne 0) {
        # Check if the error was "nothing to commit" which is not a real failure for this script
        $statusOutput = git status --porcelain # Get brief status
        if ($statusOutput -eq $null -or $statusOutput -eq "") {
             Write-Warning "No changes were detected to commit."
             # Decide if you want to exit or proceed (maybe push existing commits?)
             # For now, let's exit cleanly if there was nothing to commit AND no other error code
             if ($LASTEXITCODE -eq 1) { # Common exit code for "nothing to commit"
                Write-Host "Exiting script as there was nothing to commit."
                exit 0
             }
        }
        # If it was a different error
        Write-Error "Git commit failed. Please check the output above. Aborting push."
        Read-Host "Press Enter to exit" # Pause
        exit $LASTEXITCODE
    }

    # --- Git Push ---
    Write-Host "`nPushing changes to origin main..."
    git push origin main

    # Check if push was successful
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Git push failed. Please check the output above."
        Read-Host "Press Enter to exit" # Pause
        exit $LASTEXITCODE
    }

    Write-Host "`n-----------------------------------------------------"
    Write-Host "Push successful! GitHub Actions deployment triggered."
    Write-Host "-----------------------------------------------------"

    # Optional: Pause at the end
    # Read-Host "Press Enter to exit"