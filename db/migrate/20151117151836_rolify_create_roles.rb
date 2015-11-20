class RolifyCreateRoles < ActiveRecord::Migration
  def change
    create_table(:shoppe_roles) do |t|
      t.string :name
      t.references :resource, :polymorphic => true

      t.timestamps
    end

    create_table(:shoppe_roles_users, :id => false) do |t|
      t.references :user
      t.references :role
    end

    add_index(:shoppe_roles, :name)
    add_index(:shoppe_roles, [:name, :resource_type, :resource_id])
    add_index(:shoppe_roles_users, [ :user_id, :role_id ])
    admin_role = Role.where(name: 'admin').first_or_create
    user_role = Role.where(name: 'user').first_or_create
    guest_role = Role.where(name: 'guest').first_or_create

    User.all.each{ |user| user.roles << user_role } 
    User.where(admin: true).each{ |user| user.roles << admin_role } 

  end
end
