---
description: Antigravity Connect Workflow — OAuth-powered model bridging and multi-account rotation for OpenCode. 
---

This workflow configures and manages the `opencode-antigravity-auth` plugin, enabling access to high-performance Claude and Gemini 3 models via Google OAuth.

### 🔌 Features
- **Claude & Gemini 3**: Access to Claude Sonnet 4.6, Opus 4.6 (Thinking), and Gemini 3.1 Pro/Flash.
- **Multi-Account Rotation**: Automatic rotation when rate-limited.
- **Quota Protection**: Configurable thresholds to prevent Google account penalties.
- **Thinking Budgets**: Fine-grained control over model internal reasoning tokens.

---

### Phase 1: Installation & Config
// turbo
1. **Bootstrap Config**
   - Goal: Ensure opencode.json is correctly formatted with the OAuth plugin.
   ```powershell
   # Add plugin to configuration if not present
   $configPath = "C:\Users\crawf\.config\opencode\opencode.json"
   $config = Get-Content $configPath | ConvertFrom-Json
   if ($config.plugin -notcontains "opencode-antigravity-auth@latest") {
       $config.plugin += "opencode-antigravity-auth@latest"
       $config | ConvertTo-Json -Depth 10 | Set-Content $configPath
   }
   ```

2. **Google OAuth Login**
   - Goal: Authorize your accounts.
   ```bash
   opencode auth login
   ```
   *Action: Select "Google" -> "OAuth with Google (Antigravity)" and follow the browser instructions.*

---

### Phase 2: Model Management
3. **Verify Model Availability**
   - Goal: Confirm that the the `google/antigravity-*` models are registered.
   ```bash
   opencode models
   ```

4. **Thinking Budget Customization**
   - Goal: Tune the `antigravity.json` for specific tasks.
   - Example `~/.config/opencode/antigravity.json`:
   ```json
   {
     "scheduling_mode": "cache_first",
     "soft_quota_threshold_percent": 90,
     "keep_thinking": true
   }
   ```

---

### Phase 3: Usage
Run a task with high-reasoning Claude Opus:
```bash
opencode run "Execute complex milestone phase" --model=google/antigravity-claude-opus-4-6-thinking --variant=max
```

Trigger a research loop with Gemini 3 Flash (Fast & Large Context):
```bash
opencode run "Search across the codebase for all deprecated API calls" --model=google/antigravity-gemini-3-flash --variant=high
```

---

### 🔎 Troubleshooting
- **403 Forbidden**: Ensure you selected all scopes during OAuth login.
- **Model Not Found**: Re-run Phase 1, Step 1 to repair the JSON provider block.
- **Rate Limited**: The plugin will automatically rotate to your next account.
