class AddAdminRoleToShoppeUsers < ActiveRecord::Migration
  def change
  	add_column :shoppe_users, :admin, :boolean, default: false
  end
end
