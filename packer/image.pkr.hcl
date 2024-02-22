packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1.0.0"
    }
  }
}

variable "project_id" {
  type        = string
  description = "The GCP project ID"
}

variable "source_image_family" {
  type        = string
  description = "The source image family for the GCP image"
}

variable "image_name" {
  type        = string
  description = "The name of the created image"
}

variable "ssh_username" {
  type        = string
  description = "SSH username for the image"
}

variable "zone" {
  type        = string
  description = "The GCP zone"
}

variable "csye6225_service_path" {
  type        = string
  description = "Path to the csye6225 service file"
}

variable "installations_sh_path" {
  type        = string
  description = "Path to the installations.sh script"
}

variable "webapp_zip_path" {
  type        = string
  description = "Path to the webapp.zip file"
}

source "googlecompute" "Webapp-packer" {
  project_id          = var.project_id
  source_image_family = var.source_image_family
  image_name          = var.image_name
  ssh_username        = var.ssh_username
  zone                = var.zone
}

build {
  sources = [
    "source.googlecompute.Webapp-packer"
  ]

  provisioner "file" {
    source      = var.csye6225_service_path
    destination = "/tmp/csye6225.service"
  }

  provisioner "file" {
    source      = var.installations_sh_path
    destination = "/tmp/installations.sh"
  }

  provisioner "file" {
    source      = var.webapp_zip_path
    destination = "/tmp/webapp.zip"
  }


  provisioner "shell" {
    script = "installations.sh"
  }
}