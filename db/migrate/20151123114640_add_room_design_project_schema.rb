class AddRoomDesignProjectSchema < ActiveRecord::Migration
  def change
  	add_column :shoppe_design_projects, :name, :string
  	add_column :shoppe_design_projects, :status, :string
  	add_column :shoppe_design_projects, :submited_at, :datetime
  	add_column :shoppe_design_projects, :inspiration, :text
  	add_column :shoppe_design_projects, :inspiration_image1, :string
  	add_column :shoppe_design_projects, :inspiration_image2, :string
  	add_column :shoppe_design_projects, :inspiration_image3, :string
  	add_column :shoppe_design_projects, :user_id, :integer
  	add_column :shoppe_design_projects, :room_type_id, :integer
  	add_column :shoppe_design_projects, :room_size, :string
  end
end
