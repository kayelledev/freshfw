module Shoppe
  class Permission < ActiveRecord::Base
  	has_and_belongs_to_many :roles, :join_table => :shoppe_permissions_roles, :uniq => true, :before_remove => :check_roles!
	after_create :set_admin_role
	# before_validation :set_cancan_action
	# before_validation :set_subject_class
	before_validation :check_if_admin_present, :on => :update
	validates :name, :subject_class, :action, :presence => true
	validates :action, uniqueness: {scope: :subject_class}
    include AccessManagementProccessor
    scope :sorted, -> {order('subject_class').partition { |f| ! f.subject_class.include? "Shoppe" }.flatten}
	  
	# def set_cancan_action
	#   cancan_action, action_desc = eval_cancan_action(self.action)
	#   self.action = cancan_action
	#   self.description = action_desc
	# end

	# def set_subject_class
	#   self.subject_class = self.controller_class.constantize.permission if self.controller_class.present?
	# end

	def set_admin_role
	  admin_role = Role.where(name: 'admin').first_or_create
	  self.roles << admin_role unless self.roles.include? admin_role
	end

	def check_if_admin_present
      admin_role = Role.where(name: 'admin').first_or_create
      self.roles << admin_role unless self.roles.include? admin_role
	end

	def check_roles!(role)
      raise ActiveRecord::RecordNotSaved, "You cannot delete role for WelcomeController index permission" if self.controller_class == 'WelcomeController' && self.action == 'index'
    end

	def controller_action
	  "#{self.subject_class} #{self.action}"
	end
  end
end