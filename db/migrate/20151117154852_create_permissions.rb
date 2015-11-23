class CreatePermissions < ActiveRecord::Migration
  include AccessManagementProccessor
  def change
    create_table :shoppe_permissions do |t|
      t.string :name
      t.string :subject_class
      t.string :controller_class
      t.string :action
      t.text :description

      t.timestamps null: false
    end
    create_table(:shoppe_permissions_roles, :id => false) do |t|
      t.references :permission
      t.references :role
    end
    add_index :shoppe_roles_users, [ :user_id, :role_id ], :unique => true, :name => 'by_user_and_role'
    add_index :shoppe_permissions_roles, [ :permission_id, :role_id ], :unique => true, :name => 'by_permission_and_role'
    # rake task run to generate Permissions
    permission_generation    
    guest = Role.where(name: 'guest').first_or_create
    user = Role.where(name: 'user').first_or_create
    Permission.where.not('controller_class LIKE ?', '%Shoppe%').each{|permission| permission.roles << guest << user }
  end

end
