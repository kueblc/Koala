class ProjectsController < ApplicationController
	
	def index
		@projects = Project.all
	end
	
	def new
		@project = Project.new
	end
	
	def create
		@project = Project.new(params[:project])
		@project.author = 'Nick Pachulski'				#FIX LATER WHEN USER SYS IS UP
		@project.published_at = Time.now
		@project.modified_at = Time.now
		if @project.save
			redirect_to(@project)
		else
			render :action => 'new'
		end
	end
	
	def show
		@project = Project.find(params[:id])
		@display_code = @project.code.gsub(/\n/, '<br>').html_safe
	end
	
	def edit
		@project = Project.find(params[:id])
	end
	
	def update
		@project = Project.find(params[:id])
		if @project.update_attributes(params[:project])
			redirect_to(@prject)
		else
			render :action => 'edit'
		end
	end
	
	def destroy
	end
	
end
