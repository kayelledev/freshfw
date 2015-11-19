module Shoppe
  class Permission < ActiveRecord::Base
  	has_and_belongs_to_many :roles, :join_table => :shoppe_permissions_roles
	before_create :set_cancan_action
	before_create :set_admin_role
	before_save :set_subject_class
	before_validation :check_if_admin_present, :on => :update
	validates :name, :subject_class, :action, :presence => true
    include AccessManagementProccessor
	  
	def set_cancan_action
	  cancan_action, action_desc = eval_cancan_action(self.action)
	  self.action = cancan_action
	  self.description = action_desc
	end

	def set_subject_class
		binding.pry
	  self.subject_class = self.controller_class.constantize.permission
	end

	def set_admin_role
	  admin_role = Role.where(name: 'admin').first_or_create
	  self.roles << admin_role
	end

	def check_if_admin_present
      admin_role = Role.where(name: 'admin').first_or_create
      errors.add(:role_ids, "You can not delete admin for this permission") unless self.roles.include? admin_role
	end

	def controller_action
	  "#{self.controller_class} #{self.action}"
	end
  end
end