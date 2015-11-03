class AddSubcategoryToProduct < ActiveRecord::Migration

  def up
  	add_column :shoppe_products, :product_subcategory_id, :integer, default: nil
  end

end
