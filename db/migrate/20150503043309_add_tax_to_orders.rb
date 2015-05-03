class AddTaxToOrders < ActiveRecord::Migration
  def change
    add_column :shoppe_orders, :tax, :numericality
  end
end
