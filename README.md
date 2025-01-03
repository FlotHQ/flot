<p align="center">
<img src="./ui/public/gh_preview.svg" alt="Flot Preview" width="100%">
</p>

# Flot

[Flot](https://flot.so) is an open source Make.com alternative, a workflow automation tool that is just as easy to use as it is deployed.

## Features

TODO: Add features

## Getting Started

TODO: Add getting started

## Contributing

TODO: Add contributing


### Troubleshooting

#### SSH Agent Connection Error in Devcontainer

If you encounter this error when using Git in the devcontainer:

This means the SSH agent service isn't running on your Windows machine. To fix this:

1. Start the SSH agent service:
   ```powershell
   # Run PowerShell as Administrator
   Set-Service ssh-agent -StartupType Automatic
   Start-Service ssh-agent
   ```

2. Add your SSH key to the agent:
   ```powershell
   ssh-add $HOME/.ssh/id_rsa  # or path to your specific key
   ```

3. Verify the key was added:
   ```powershell
   ssh-add -l
   ```

4. Rebuild your devcontainer

If you're still having issues:
- Ensure your SSH keys exist in your local `~/.ssh` directory
- Verify your SSH key is added to your GitHub account
- Check the permissions of your SSH files with `ls -la ~/.ssh` in the container

## License

Flot is licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).