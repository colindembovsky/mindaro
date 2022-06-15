variable "resource_group_location" {
  default     = "southcentralus"
  description = "Location of the resource group."
}

variable "agent_count" {
  default = 2
}

variable "dns_prefix" {
  default = "cdmindaro"
}

variable "cluster_name" {
  default = "cdmindaro"
}

variable "resource_group_name" {
  default = "cd-mindaro"
}

variable "location" {
  default = "South Central US"
}

variable "log_analytics_workspace_name" {
  default = "AKSLogAnalyticsWorkspace"
}

# refer https://azure.microsoft.com/global-infrastructure/services/?products=monitor for log analytics available regions
variable "log_analytics_workspace_location" {
  default = "southcentralus"
}

# refer https://azure.microsoft.com/pricing/details/monitor/ for log analytics pricing 
variable "log_analytics_workspace_sku" {
  default = "PerGB2018"
}

variable "namespace" {
  default = "bikeapp"
}

variable "kubeconfig" {
  default = "~/tfkube"
}