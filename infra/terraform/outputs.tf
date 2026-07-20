output "r2_bucket" {
  value = cloudflare_r2_bucket.media.name
}
output "r2_endpoint" {
  value = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
}
output "environment" {
  value = var.environment
}
