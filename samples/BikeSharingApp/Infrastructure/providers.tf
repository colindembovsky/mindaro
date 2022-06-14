terraform {

  required_version = ">=0.12"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.7.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "cd-mindaro-shared"
    storage_account_name = "cdminshared"
    container_name       = "tfstate"
    key                  = "dev.mindaro.tfstate"
    use_azuread_auth     = true
  }
}

provider "azurerm" {
  use_oidc = true
  features {}
}