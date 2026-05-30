variable "aws_region" {
  description = "AWS region gdje se kreira infrastruktura"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID za EC2 instance (Ubuntu 22.04 LTS us-east-1)"
  type        = string
  default     = "ami-0c7217cdde317cfec"
}

variable "key_pair_name" {
  description = "Naziv key pair-a za SSH pristup EC2 instancama"
  type        = string
  default     = "amiibo-key"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "amiibo_admin"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Naziv baze podataka"
  type        = string
  default     = "amiibo_db"
}

variable "s3_bucket_name" {
  description = "Naziv S3 bucketa (mora biti globalno jedinstven)"
  type        = string
  default     = "amiibo-card-catcher-assets"
}

variable "app_repo" {
  description = "GitHub URL aplikacije"
  type        = string
  default     = "https://github.com/irmelap2412/amiibo-card-catcher"
}
