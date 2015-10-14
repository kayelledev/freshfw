class AddDescriptionToShoppeDeliveryServices < ActiveRecord::Migration
  def change
    add_column :shoppe_delivery_services, :description, :string
  end
end
