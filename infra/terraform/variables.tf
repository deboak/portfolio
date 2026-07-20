variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare token scoped to R2 bucket management."
}
variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account identifier."
}
variable "application_name" {
  type    = string
  default = "portfolio"
}
variable "environment" {
  type = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}
variable "r2_location" {
  type    = string
  default = "WEUR"
}
