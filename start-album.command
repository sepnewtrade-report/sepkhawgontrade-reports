#!/bin/bash
cd "$(dirname "$0")"
echo "================================================="
echo "  🚀 กำลังเริ่มระบบ Web Album รายการผลิตคลิป..."
echo "  🌐 เบราว์เซอร์จะเปิดไปที่: http://localhost:3457"
echo "================================================="
sleep 1
open "http://localhost:3457"
node notebooklm-manager/generate-album.js
