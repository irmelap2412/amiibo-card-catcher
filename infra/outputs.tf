output "alb_dns_name" {
  description = "URL aplikacije - otvori u browseru"
  value       = "http://${aws_lb.main.dns_name}"
}



output "rds_endpoint" {
  description = "RDS endpoint za direktnu konekciju"
  value       = aws_db_instance.main.address
  sensitive   = true
}

output "ec2_instance_1_ip" {
  description = "Javna IP adresa prve EC2 instance"
  value       = aws_instance.app_1.public_ip
}

output "ec2_instance_2_ip" {
  description = "Javna IP adresa druge EC2 instance"
  value       = aws_instance.app_2.public_ip
}

output "vpc_id" {
  description = "ID kreiranog VPC-a"
  value       = aws_vpc.main.id
}
