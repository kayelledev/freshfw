class AddOtherDetailsToShoppeProducts < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :other_details, :text
  end
end
