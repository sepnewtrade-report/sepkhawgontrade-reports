import asyncio
import sys
import json
from datetime import datetime, timezone

try:
    from notebooklm import NotebookLMClient
except ImportError:
    # If outputting JSON, return the error as JSON
    if "--list-json" in sys.argv or "--delete" in sys.argv:
        print(json.dumps({"error": "notebooklm-py is not installed. Please run: pip install notebooklm-py"}))
    else:
        print("\n[!] Error: 'notebooklm-py' is not installed in the current Python environment.")
        print("    Please run: pip install notebooklm-py\n")
    sys.exit(1)

def format_date(dt):
    if not dt:
        return None
    return dt.isoformat()

def get_client_programmatic():
    # Helper to load client without system exit, raising exception instead
    return NotebookLMClient.from_storage()

async def list_json():
    try:
        async with get_client_programmatic() as client:
            notebooks = await client.notebooks.list()
            data = []
            for nb in notebooks:
                data.append({
                    "id": nb.id,
                    "title": nb.title or "Untitled Notebook",
                    "created_at": format_date(nb.created_at),
                    "sources_count": nb.sources_count,
                    "is_owner": nb.is_owner
                })
            print(json.dumps({"success": True, "notebooks": data}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

async def delete_json(notebook_id):
    try:
        async with get_client_programmatic() as client:
            await client.notebooks.delete(notebook_id=notebook_id)
            print(json.dumps({"success": True, "id": notebook_id}))
    except Exception as e:
        print(json.dumps({"success": False, "id": notebook_id, "error": str(e)}))

# Original CLI Interactive Logic
def format_date_cli(dt):
    if not dt:
        return "N/A"
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")

def get_client_cli():
    try:
        client = NotebookLMClient.from_storage()
        return client
    except Exception as e:
        print("\n[!] Failed to load authentication credentials.")
        print("    Please make sure you have logged in using the command: notebooklm login")
        print(f"    Details: {e}\n")
        sys.exit(1)

async def delete_notebook_cli(client, nb_id, title):
    try:
        await client.notebooks.delete(notebook_id=nb_id)
        print(f"✅ Deleted: {title} ({nb_id})")
        return True
    except Exception as e:
        print(f"❌ Failed to delete {title} ({nb_id}): {e}")
        return False

async def run_cli():
    print("=" * 60)
    print("          Google NotebookLM Auto-Deletion Tool          ")
    print("=" * 60)

    try:
        async with get_client_cli() as client:
            notebooks = await client.notebooks.list()
            if not notebooks:
                print("\nNo notebooks found in your account.")
                return

        print(f"\nFound {len(notebooks)} notebooks in your account:")
        for idx, nb in enumerate(notebooks, 1):
            date_str = format_date_cli(nb.created_at)
            print(f" {idx:2d}. [{nb.id}] {nb.title} (Created: {date_str}, Sources: {nb.sources_count})")

        print("\nSelect an auto-deletion method:")
        print(" 1. Delete ALL notebooks (ลบทั้งหมด)")
        print(" 2. Delete by keyword in Title (ลบที่มีคำเฉพาะเจาะจงในชื่อ)")
        print(" 3. Delete by age / older than N days (ลบที่เก่ากว่า N วัน)")
        print(" 4. Interactive selection (เลือกทีละรายการ)")
        print(" 5. Exit (ออกจากโปรแกรม)")

        choice = input("\nEnter choice (1-5): ").strip()

        to_delete = []
        now = datetime.now(timezone.utc)

        if choice == "1":
            confirm = input("\n[WARNING] Are you sure you want to delete ALL notebooks? (y/n): ").strip().lower()
            if confirm == 'y':
                to_delete = notebooks

        elif choice == "2":
            keyword = input("\nEnter keyword to search in titles (case-insensitive): ").strip().lower()
            if not keyword:
                print("Keyword cannot be empty. Exiting.")
                return
            to_delete = [nb for nb in notebooks if keyword in nb.title.lower()]
            print(f"\nFound {len(to_delete)} notebooks matching keyword '{keyword}':")
            for nb in to_delete:
                print(f" - {nb.title} ({nb.id})")

        elif choice == "3":
            try:
                days = int(input("\nEnter age in days (e.g. 7, 30): ").strip())
            except ValueError:
                print("Invalid number of days. Exiting.")
                return
            
            for nb in notebooks:
                if nb.created_at:
                    age_days = (now - nb.created_at).days
                    if age_days >= days:
                        to_delete.append(nb)
            
            print(f"\nFound {len(to_delete)} notebooks older than {days} days:")
            for nb in to_delete:
                age_days = (now - nb.created_at).days
                print(f" - {nb.title} (Created: {format_date_cli(nb.created_at)}, Age: {age_days} days)")

        elif choice == "4":
            print("\nInteractive selection. Enter 'y' to delete, 'n' to keep, 'q' to quit selection:")
            for nb in notebooks:
                ans = input(f"Delete '{nb.title}' (Created: {format_date_cli(nb.created_at)})? (y/n/q): ").strip().lower()
                if ans == 'y':
                    to_delete.append(nb)
                elif ans == 'q':
                    break
        
        elif choice == "5":
            print("Exiting.")
            return
        
        else:
            print("Invalid choice. Exiting.")
            return

        if not to_delete:
            print("\nNo notebooks selected for deletion.")
            return

        # Final Confirmation
        print("\n" + "!" * 50)
        print(f"WARNING: You are about to permanently delete {len(to_delete)} notebook(s)!")
        print("This action is permanent and cannot be undone.")
        print("!" * 50)
        
        final_confirm = input(f"Type 'DELETE' to confirm deletion of {len(to_delete)} notebooks: ").strip()
        if final_confirm == "DELETE":
            print("\nStarting deletion process...")
            success_count = 0
            for nb in to_delete:
                success = await delete_notebook_cli(client, nb.id, nb.title)
                if success:
                    success_count += 1
                await asyncio.sleep(0.5)
            print(f"\nDeletion completed: Successfully deleted {success_count}/{len(to_delete)} notebooks.")
        else:
            print("\nDeletion cancelled.")
    except Exception as e:
        print("\n[!] Failed to load authentication credentials or connect to NotebookLM.")
        print("    Please make sure you have logged in using the command: notebooklm login")
        print(f"    Details: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    if "--list-json" in sys.argv:
        asyncio.run(list_json())
    elif "--delete" in sys.argv:
        # Find index of --delete and get next argument
        try:
            delete_idx = sys.argv.index("--delete")
            target_id = sys.argv[delete_idx + 1]
            asyncio.run(delete_json(target_id))
        except (ValueError, IndexError):
            print(json.dumps({"success": False, "error": "Missing notebook ID for --delete"}))
    else:
        try:
            asyncio.run(run_cli())
        except KeyboardInterrupt:
            print("\nProgram interrupted. Exiting.")
            sys.exit(0)
