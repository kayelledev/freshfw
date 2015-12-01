module Shoppe
  class Role < ActiveRecord::Base
  	has_and_belongs_to_many :users, :join_table => :shoppe_roles_users
    has_and_belongs_to_many :permissions, :join_table => :shoppe_permissions_roles, :uniq => true, :before_remove => :check_permissions!
    rolify :role_cname => 'User'
    belongs_to :resource, :polymorphic => true
    validates :name, :presence => true
    validates :resource_type,
            :inclusion => { :in => Rolify.resource_types },
            :allow_nil => true
    before_destroy :can_delete_role?
    scope :list_without_admin, -> {where.not(name: 'admin')}

    scopify
    
    def check_permissions!(permission)
      raise ActiveRecord::RecordNotSaved, "You cannot delete permissions for admin role" if self.name == 'admin'
    end
    
    def can_delete_role?
      if self.name == 'admin' || self.name == 'user' || self.name == 'guest'
        errors.add(:base, "You can not delete user, admin or guest role")
        return false
      end 
    end
  end
  

end