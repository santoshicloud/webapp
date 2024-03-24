packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">=1"
    }
  }
}

source "googlecompute" "centos_stream_8" {
  project_id           = "devproject-414823"
  source_image_family  = "centos-stream-8"
  ssh_username         = "centos"
  image_name           = "centos-stream-8-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  image_description    = "new image"
  zone                 = "us-east4-a"
}

build {
  sources = [
    "source.googlecompute.centos_stream_8"
  ]

    provisioner "file" {
    source      = "../csye6225.service"
    destination = "/tmp/csye6225.service"
  }

  provisioner "file" {
    source      = "installations.sh"
    destination = "/tmp/installations.sh"
  }

//    provisioner "file" {
//   source      = "../.env"
//   destination = "/tmp/.env"
// }

  provisioner "file" {
    source      = "../webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "opsAgent.sh"
    destination = "/tmp/opsAgent.sh"
  }

  provisioner "shell" {
    script = "/tmp/installations.sh"
  }

  provisioner "shell" {
    script = "/tmp/opsAgent.sh"
  }
}