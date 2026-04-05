#!/bin/bash
echo "Beginning deployment"

echo "Pre-deployment commit: $(git show --oneline -s HEAD)"
git switch main
git pull
echo "Post-deployment commit: $(git show --oneline -s HEAD)"

chmod +x scripts/start-prod.sh
sudo cp ./deploy/daq.conf /etc/nginx/conf.d/daq.conf

sudo systemctl restart daq-backend
sudo systemctl restart nginx

echo "Backend Status:"
systemctl status daq-backend

echo "Nginx Status:"
systemctl status nginx

echo "Deployment finished"
