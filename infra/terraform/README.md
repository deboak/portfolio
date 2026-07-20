# Terraform infrastructure

This stack creates one private Cloudflare R2 media bucket per environment and disables its public `r2.dev` hostname. Neon PostgreSQL, Upstash Redis, Render, and Vercel connection values are injected through deployment environment variables and are never committed to Terraform variables.

```powershell
cd infra/terraform
$env:TF_VAR_cloudflare_api_token = "your-scoped-token"
terraform init
terraform workspace new staging
terraform plan -var-file=staging.tfvars.example -out=staging.tfplan
terraform apply staging.tfplan
```

Use separate `staging` and `production` workspaces. Copy the example tfvars before replacing placeholders; real `.tfvars`, plans, local state, and provider locks are ignored. Configure an encrypted remote backend before team use because Terraform state can contain sensitive infrastructure metadata.
