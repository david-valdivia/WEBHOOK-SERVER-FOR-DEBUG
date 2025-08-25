#!/bin/bash

echo "Enviando HTML al servidor..."

curl -X POST http://localhost:1995/just?return=true \
  -H "Content-Type: text/html" \
  -d '<!DOCTYPE html>
<body>
    Hello <b>world</b>!
</body>'

echo -e "\n\nHTML enviado! Revisa la interfaz web para ver cómo se renderiza."