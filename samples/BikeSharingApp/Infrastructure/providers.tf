terraform {

  required_version = ">=0.12"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>2.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "cd-mindaro"
    storage_account_name = "cdminstore"
    container_name       = "tfstate"
    key                  = "mindaro.tfstate"
  }
}

provider "azurerm" {
  features {}
}