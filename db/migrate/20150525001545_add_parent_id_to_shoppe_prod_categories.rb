class AddParentIdToShoppeProdCategories < ActiveRecord::Migration
  def change
    remove_column :shoppe_product_categories, :subcategory_name
    rename_column :shoppe_product_categories, :subcategory_id, :parent_id
  end
end
