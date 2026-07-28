import os
import json

sidecars_dir = '/Users/soontorntachasakulnapaporn/.gemini/config/sidecars'
results = []

if os.path.exists(sidecars_dir):
    for entry in os.listdir(sidecars_dir):
        entry_path = os.path.join(sidecars_dir, entry)
        if os.path.isdir(entry_path):
            sidecar_json_path = os.path.join(entry_path, 'sidecar.json')
            if os.path.exists(sidecar_json_path):
                try:
                    with open(sidecar_json_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    display_name = data.get('displayName', entry)
                    builtin = data.get('builtin', '')
                    args = data.get('args', [])
                    
                    cron = "N/A"
                    cmd = "N/A"
                    prompt = "N/A"
                    
                    if builtin == 'schedule' and args:
                        cron = args[0]
                        if len(args) > 1:
                            cmd = args[1]
                        if len(args) > 4 and args[1] == 'agentapi' and args[2] == 'new-conversation':
                            # pro prompt is usually in args[4]
                            prompt = args[4]
                        elif len(args) > 3:
                            prompt = args[3]
                            
                    results.append({
                        'folder': entry,
                        'displayName': display_name,
                        'cron': cron,
                        'cmd': cmd,
                        'prompt_preview': prompt[:100].replace('\n', ' ') if isinstance(prompt, str) else str(prompt)[:100]
                    })
                except Exception as e:
                    results.append({
                        'folder': entry,
                        'error': str(e)
                    })

print(json.dumps(results, indent=2, ensure_ascii=False))
