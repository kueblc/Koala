class CreateProjects < ActiveRecord::Migration
  def self.up
    create_table :projects do |t|
			
			t.string :title
			t.string :author
			t.text :code
			t.text :contributers
			t.datetime :published_at
			t.datetime :modified_at
			
      t.timestamps
    end
  end

  def self.down
    drop_table :projects
  end
end
