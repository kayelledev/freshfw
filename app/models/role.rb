class Role < ActiveRecord::Base
  rolify :role_cname => 'User'
  has_and_belongs_to_many :users, :join_table => :shoppe_users_roles
  has_and_belongs_to_many :permissions
  belongs_to :resource, :polymorphic => true

  validates :resource_type,
            :inclusion => { :in => Rolify.resource_types },
            :allow_nil => true

  scopify
end
