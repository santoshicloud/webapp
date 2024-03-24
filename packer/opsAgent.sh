#!/bin/bash

sudo curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
 
logger=$(cat << EOF
logging:
  receivers:
    webapp-receiver:
      type: files
      include_paths:
        - /var/log/webapp/application.log
      record_log_file_path: true
  processors:
    webapp-processor:
      type: parse_json
      time_key: time
      time_format: "%Y-%m-%dT%H:%M:%S.%L%Z"
    move_severity:
      type: modify_fields
      fields:
        severity:
          move_from: jsonPayload.severity  
  service:
    pipelines:
      default_pipeline:
        receivers: [webapp-receiver]
        processors: [webapp-processor, move_severity]
EOF
)
sudo cp /etc/google-cloud-ops-agent/config.yaml /etc/google-cloud-ops-agent/config.yaml.backup

# Create a new config-yml file
echo "$logger" | sudo tee /etc/google-cloud-ops-agent/config.yaml >/dev/null

# Set permissions for the new config.yml file
sudo chown -R csye6225: csye6225 /etc/google-cloud-ops-agent/config.yaml

sudo mkdir -p /var/log/webapp

sudo touch /var/log/webapp/application.log

sudo chown -R csye6225:csye6225 /var/log/webapp

sudo systemctl enable google-cloud-ops-agent
sudo systemctl start google-cloud-ops-agent
sudo systemctl restart google-cloud-ops-agent
sudo systemctl status google-cloud-ops-agent
sudo journalctl -xe