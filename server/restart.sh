while true; do
  echo "Starting server..."

  # Jalankan clean terminal
  clear

  # Jalankan server dengan nodemon
  nodemon app.js &  # Menjalankan nodemon di background
  SERVER_PID=$!     # Menyimpan PID dari proses nodemon

  # Tunggu selama 60 detik
  sleep 10

  # Matikan proses nodemon
  kill $SERVER_PID

  echo "Restarting server..."
done