class RenameDeliveryNameAtShoppeOrders < ActiveRecord::Migration
  def up
    rename_column :shoppe_orders, :delivery_name, :delivery_first_name
  end

  def down
    rename_column :shoppe_orders, :delivery_first_name, :delivery_name
  end
end
