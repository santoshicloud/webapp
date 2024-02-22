packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1.0.0"
    }
  }
}

 
source "googlecompute" "Webapp-packer" {
  project_id      = "devproject-414823"
  source_image_family    = "centos-stream-8"
  image_name= "centos-stream-8-image2"
  ssh_username    = "centos"
  zone            = "us-east4-a"
}
 
build {
  sources = [
    "source.googlecompute.Webapp-packer"
  ]

  provisioner "file" {
    source      = "C:\\Users\\satya\\OneDrive\\Desktop\\repo\\v4\\webapplaptop\\csye6225.service"
    destination = "/tmp/csye6225.service"
  }

  provisioner "file" {
    source      = "C:\\Users\\satya\\OneDrive\\Desktop\\repo\\v4\\webapplaptop\\packer\\installations.sh"
    destination = "/tmp/installations.sh"
  }

  provisioner "file" {
    source      = "C:\\Users\\satya\\OneDrive\\Desktop\\repo\\webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    script = "installations.sh"
  }
}