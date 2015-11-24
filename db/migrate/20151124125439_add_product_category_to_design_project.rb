class AddProductCategoryToDesignProject < ActiveRecord::Migration
  def change
  	add_column :shoppe_design_projects, :product_category_id, :integer
  end
end
