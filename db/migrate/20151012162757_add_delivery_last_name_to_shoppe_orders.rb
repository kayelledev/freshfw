class AddDeliveryLastNameToShoppeOrders < ActiveRecord::Migration
  def change
    add_column :shoppe_orders, :delivery_last_name, :string
  end
end
