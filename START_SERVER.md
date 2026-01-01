# How to Start the Server

## Quick Start

1. **Make sure dependencies are installed:**
   ```bash
   npm install
   ```

2. **Set up your MongoDB connection:**
   - Edit `.env.local` file
   - Add your MongoDB URI:
     ```
     MONGODB_URI=mongodb://localhost:27017/aeterna-hypercars
     ```
   - Or for MongoDB Atlas:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aeterna-hypercars
     ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Verify the server is running:**
   - Open your browser and go to: http://localhost:3000
   - Check API health: http://localhost:3000/api/health
   - You should see: `{"status":"OK","message":"Aeterna API is running",...}`

## Troubleshooting

### Port 3000 already in use
If you get "EADDRINUSE" error:
- Kill the process using port 3000:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
  ```
- Or change PORT in `.env.local` to a different number (e.g., 3001)

### MongoDB Connection Failed
- Make sure MongoDB is running (if using local MongoDB)
- Check your MongoDB URI in `.env.local`
- For MongoDB Atlas, make sure:
  - Your IP is whitelisted
  - Username and password are correct
  - The connection string is correct

### "Failed to fetch" error in browser
- Make sure the server is running (check step 4 above)
- Open browser console (F12) to see detailed error messages
- Check that you're accessing the site from the same machine (localhost)

