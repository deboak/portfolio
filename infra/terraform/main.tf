provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

locals {
  prefix = "${var.application_name}-${var.environment}"
}

resource "cloudflare_r2_bucket" "media" {
  account_id    = var.cloudflare_account_id
  name          = "${local.prefix}-media"
  location      = var.r2_location
  storage_class = "Standard"
}

resource "cloudflare_r2_managed_domain" "media" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.media.name
  enabled     = false
}
