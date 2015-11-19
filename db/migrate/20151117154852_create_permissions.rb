class CreatePermissions < ActiveRecord::Migration
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
  
  end

end
